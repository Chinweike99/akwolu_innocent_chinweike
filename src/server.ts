import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());



app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Akwolu Inncent Chinweike!');
});

interface DataRequestBody {
    name: string;
    age: number;
}

app.post('/data', (req: Request<{}, {}, DataRequestBody>, res: Response) => {
  try {
    const { name, age } = req.body;

    res.json({
      name,
      age,
      message: `Received data for ${name}, age ${age}`,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})