const { sequelize } = require('../models');

async function fixAboutHeroSubtitle() {
  try {
    console.log('Fixing about_hero subtitle column...');
    
    // Update the column type to TEXT
    await sequelize.query("ALTER TABLE about_hero MODIFY COLUMN subtitle TEXT");
    console.log('✅ Successfully updated about_hero.subtitle column to TEXT type');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    throw error;
  }
}

// Run the fix
fixAboutHeroSubtitle()
  .then(() => {
    console.log('Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fix failed:', error);
    process.exit(1);
  });
