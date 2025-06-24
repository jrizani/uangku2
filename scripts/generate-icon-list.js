const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const mdi = require('@mdi/js');

function generateIconList() {
    console.log('Generating icon list...');
    const iconList = [];

    // 1. Proses Ikon Font Awesome
    try {
        const faPath = path.join(__dirname, '..', 'node_modules', '@fortawesome', 'fontawesome-free', 'metadata', 'icons.yaml');
        const faFile = fs.readFileSync(faPath, 'utf8');
        const faData = yaml.load(faFile);

        for (const iconName in faData) {
            const icon = faData[iconName];
            if (icon.styles && (icon.styles.includes('solid') || icon.styles.includes('brands'))) {
                const style = icon.styles.includes('solid') ? 'fas' : 'fab';
                iconList.push({
                    id: `fa:${iconName}`,
                    name: iconName.replace(/-/g, ' '),
                    search: [iconName, ...icon.search.terms].join(' '),
                    className: `${style} fa-${iconName}`,
                    type: 'fa'
                });
            }
        }
        console.log(`Processed ${Object.keys(faData).length} Font Awesome icons.`);
    } catch (error) {
        console.error('Could not process Font Awesome icons:', error.message);
    }

    // 2. Proses Ikon Material Design
    try {
        const mdiIconNames = Object.keys(mdi).filter(name => name.startsWith('mdi'));
        mdiIconNames.forEach(iconName => {
            const name = iconName
                .replace(/^mdi/, '')
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .toLowerCase();

            iconList.push({
                id: `mdi:${iconName}`,
                name: name,
                search: name,
                path: mdi[iconName], // Simpan path SVG untuk dirender
                type: 'mdi'
            });
        });
        console.log(`Processed ${mdiIconNames.length} Material Design icons.`);
    } catch (error) {
        console.error('Could not process Material Design icons:', error.message);
    }


    // 3. Tulis hasil ke file JSON di dalam folder src
    const outputDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, 'icon-list.json');
    fs.writeFileSync(outputPath, JSON.stringify(iconList, null, 2));

    console.log(`Successfully generated ${iconList.length} icons at ${outputPath}`);
}

generateIconList();