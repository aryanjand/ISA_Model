const http = require('http');

class MyPipeline {
    static task = 'ner';
    static model = 'Xenova/bert-base-NER-uncased';
    static instance = null;

    static async getInstance(progressCallback = null) {
        if (this.instance === null) {
            let { pipeline } = await import('@xenova/transformers');
            this.instance = pipeline(this.task, this.model, { progressCallback });
        }
        return this.instance;
    }
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {

                const { text } = JSON.parse(body);

                // Make sure 'text' is defined before using it
                if (text) {

                    const pipeline = await MyPipeline.getInstance();
                    const response = await pipeline(text);
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                    
                } else {
                    res.statusCode = 400; // Bad Request
                    res.end('Invalid request data');
                }
            } catch (error) {
                console.error('Error processing request:', error); // Log the error
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});



const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});