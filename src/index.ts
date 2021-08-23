import axios from "axios";
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: process.env.DATABASE_URL,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});

const token: string = process.env.TOKEN  || '';

exports.main = async (event: any) => {
  // cloudwatch
  if (event && event.type && event.type === 'crawlData') {
    return await findPlants(token);
  } else if (event && event.type && event.type === 'nearPlants') {
    // we can handle endpoints here if we want
    return await getNearPlans();
  }
  return;
} 

const findPlants = async (token: string) => {
  const lands = getLands();
  return await Promise.allSettled(lands.map(async land => {
    const resp = (await axios.get(`https://backend-farm.plantvsundead.com/land/${land.x}/${land.y}`, {
      headers: {
        'User-Agent': 'PVU',
        'Authorization': `Bearer Token: ${token}`
      },
    }))?.data?.data;
    if (resp.ownerId) {
      const ownerId = resp.ownerId;
      // check plants for owner ID
      const plantResponse = await getPlants(ownerId);
      // check active tools
      return await Promise.allSettled(plantResponse.map(async (plant: any) => {
        return await connection.query(
          'REPLACE INTO plants SET id = ?, plant = ?, date = ?, URL = ?, crawlDate = ?', [
            plant.id,
            JSON.stringify(plant),
            new Date(plant.activeTools.find((tool: any) => tool.type === 'WATER').endTime),
            `https://marketplace.plantvsundead.com/login#/farm/${plant.id}`,
             new Date()
          ]);
      }));
    }
    return;
  }));
}

const getPlants = async (ownerId: string, offset = 0, plants = []): Promise<any[]> => {
  const maxPagelimit = 20;
  const response = (await axios.get(`https://backend-farm.plantvsundead.com/farms/other/${ownerId}?limit=${maxPagelimit}&offset=${offset}`, {
    headers: {
      'User-Agent': 'PVU',
      'Authorization': `Bearer Token: ${token}`
    },
  }))?.data;
  if (response.status === 0) {
    plants = plants.concat(response.data);
    if (response.total > offset + maxPagelimit) {
      await timeout(1000);
      return await getPlants(ownerId, offset + maxPagelimit, plants);
    }
  }
  return plants;
}

const getNearPlans = async () => {
  return await connection.query(
    'SELECT * from pvu.plants WHERE date <= NOW() - INTERVAL 10 MINUTE;');
}

const getLands = () => {
  const lands = [];
  const min = -16;
  const max = 16;
  for (let x = min; x < max; x++) {
    for (let y = min; y < max; y++) {
      lands.push({x, y});
    }
  }
  return lands;
}

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}