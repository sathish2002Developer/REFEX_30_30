const { sequelize } = require('../models');
const { AboutVisionMission } = require('../models');
const fs = require('fs');
const path = require('path');

async function seedAboutVisionMission() {
  try {
    console.log('Starting about vision mission seed...');
    
    // Read the seed data
    const seedDataPath = path.join(__dirname, '../seeds/about_vision_mission.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    // Check if data already exists
    const existing = await AboutVisionMission.findOne();
    
    if (existing) {
      console.log('About vision mission data already exists. Updating...');
      await existing.update({
        visionTitle: seedData.visionTitle,
        visionDescription: seedData.visionDescription,
        visionImage: seedData.visionImage,
        missionTitle: seedData.missionTitle,
        missionImage: seedData.missionImage,
        missionPointsJson: JSON.stringify(seedData.missionPoints),
        isActive: seedData.isActive
      });
      console.log('✅ About vision mission data updated successfully');
    } else {
      console.log('Creating new about vision mission data...');
      await AboutVisionMission.create({
        visionTitle: seedData.visionTitle,
        visionDescription: seedData.visionDescription,
        visionImage: seedData.visionImage,
        missionTitle: seedData.missionTitle,
        missionImage: seedData.missionImage,
        missionPointsJson: JSON.stringify(seedData.missionPoints),
        isActive: seedData.isActive
      });
      console.log('✅ About vision mission data created successfully');
    }
    
    console.log('About vision mission seed completed successfully');
    
  } catch (error) {
    console.error('❌ About vision mission seed failed:', error.message);
    throw error;
  }
}

// Run the seed if this script is executed directly
if (require.main === module) {
  seedAboutVisionMission()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedAboutVisionMission;
