// Import Mirador from node_modules
import Mirador from 'mirador';
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import { miradorSharePlugin, miradorShareDialogPlugin } from 'mirador-share-plugin';
import AnotherCustomMenuItem from './AnotherCustomMenuItem.jsx';
import CustomMenuItem from './CustomMenuItem.jsx';
import CustomMenuComponent from './CustomMenuComponent.jsx';

const query = `
    SELECT DISTINCT ?manifest WHERE {
      ?work wdt:P6108 ?manifest;
            wdt:P571 ?date.
    FILTER(
      ?date >= "0500-01-01T00:00:00Z"^^xsd:dateTime
      && ?date < "1500-01-01T00:00:00Z"^^xsd:dateTime
      && !CONTAINS(LCASE(STR(?manifest)), "gallica.bnf.fr")
    )
    }
    LIMIT 40
`;

async function loadGallery() {
    const root = document.getElementById('demo');
    root.textContent = 'Searching Wikidata for medieval IIIF works…';

    try {
        const endpoint = new URL('https://query.wikidata.org/sparql');
        endpoint.searchParams.set('query', query);
        endpoint.searchParams.set('format', 'json');

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Wikidata returned ${response.status}`);

        const data = await response.json();
        const catalog = [...new Set(data.results.bindings.map(({ manifest }) => manifest.value))]
            .map((manifestId) => ({ manifestId }));

        if (catalog.length === 0) throw new Error('No matching IIIF manifests were found');

        Mirador.viewer({
            id: 'demo',
            catalog,
            windows: [{
                imageToolsEnabled: true,
                imageToolsOpen: true,
                manifestId: catalog[0].manifestId,
            }],
            theme: {
                palette: {
                    primary: {
                        main: '#1967d2',
                    },
                },
            },
        }, [
            ...miradorImageToolsPlugin,
            {...miradorSharePlugin, target: 'CustomMenuComponent' },
            miradorShareDialogPlugin,
            AnotherCustomMenuItem,
            CustomMenuItem,
            CustomMenuComponent,
        ]);
    } catch (error) {
        console.error('Unable to discover medieval IIIF manifests:', error);
        root.textContent = 'Could not load medieval IIIF works from Wikidata. Check your connection and reload the page.';
    }
}

loadGallery();

