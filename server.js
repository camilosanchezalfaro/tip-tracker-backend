app.post('/api/scan', async (req, res) => {
    const { url, keywords, titles, formats } = req.body;

    if (!url || !keywords || keywords.length === 0) {
        return res.status(400).json({ success: false, message: 'URL o palabras clave no proporcionadas.' });
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let foundTips = [];

        // Ajustar el selector para extraer solo los pronósticos específicos basados en los títulos y formatos
        $('p').each((_, element) => {
            const text = $(element).text().trim();
            
            // Verificar si el texto coincide con las palabras clave y los títulos proporcionados
            const titleMatches = titles.some(title => text.includes(title));
            const formatMatches = formats.some(format => text.includes(format));

            // Si encontramos coincidencias con los títulos y los formatos, agregamos el pronóstico
            if (titleMatches && formatMatches) {
                foundTips.push(text);
            }
        });

        // Filtrar los pronósticos basados en la fecha (si está incluida)
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        foundTips = foundTips.filter(tip => tip.includes(today));

        if (foundTips.length > 0) {
            return res.json({ success: true, tips: foundTips });
        } else {
            return res.json({ success: false, message: 'No se encontraron tips con esas palabras clave.' });
        }

    } catch (error) {
        console.error('Error al analizar la URL:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la URL.' });
    }
});
