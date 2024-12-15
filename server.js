// Diccionarios en memoria (luego podríamos guardar esto en una base de datos)
let titleDictionary = [];
let dateFormatDictionary = [];
let predictionFormatDictionary = [];

app.post('/api/add-dictionary', (req, res) => {
    const { title, dateFormat, predictionFormat } = req.body;

    if (!title || !dateFormat || !predictionFormat) {
        return res.status(400).json({ success: false, message: 'Faltan campos en el diccionario.' });
    }

    // Agregar los valores al diccionario
    titleDictionary.push(title);
    dateFormatDictionary.push(dateFormat);
    predictionFormatDictionary.push(predictionFormat);

    console.log('Diccionario actualizado:', { titleDictionary, dateFormatDictionary, predictionFormatDictionary });

    return res.json({ success: true, message: 'Diccionario actualizado con éxito.' });
});
