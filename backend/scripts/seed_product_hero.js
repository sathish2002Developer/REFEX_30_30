const db = require('../models');

async function main() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const payload = {
      backgroundImage: 'https://readdy.ai/api/search-image?query=Modern%20pharmaceutical%20laboratory%20with%20scientists%20working%20on%20drug%20development%2C%20clean%20sterile%20environment%20with%20advanced%20equipment%2C%20molecular%20structures%20and%20chemical%20formulas%20in%20background%2C%20blue%20and%20white%20color%20scheme%2C%20professional%20medical%20research%20facility%2C%20API%20development%2C%20therapeutic%20innovation%2C%20contemporary%20scientific%20design&width=1920&height=800&seq=products-hero&orientation=landscape',
      overlayFrom: 'rgba(0,0,0,0.5)',
      overlayTo: 'rgba(0,0,0,0.3)',
      titleLine1: 'Our Product',
      titleLine2: 'Portfolio',
      subtitle: 'Leader in Psychotropic Substances & CNS APIs with 40+ years of proven expertise',
      highlightText: 'Psychotropic Substances',
      description: 'Comprehensive API portfolio across diverse therapeutic segments serving healthcare needs worldwide.',
      titleColor: '#FFFFFF',
      subtitleColor: 'rgba(255, 255, 255, 0.9)',
      descriptionColor: 'rgba(255, 255, 255, 0.8)',
      aosType: 'fade-up',
      aosDuration: 1000,
      aosDelay: 400,
      isActive: true,
    };

    const existing = await db.ProductHero.findOne();
    if (existing) {
      await existing.update(payload);
      console.log('Updated existing ProductHero');
    } else {
      await db.ProductHero.create(payload);
      console.log('Created ProductHero');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();


