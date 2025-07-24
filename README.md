
# Firebase Studio Project

This is a Next.js project created with Firebase Studio.

## Getting Started

### 1. Install Dependencies
First, install the necessary packages for the project:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a file named `.env` in the root of the project and add your API keys. You can copy the structure from `.env.example` if it exists.

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase Web API Key. You can get this from your Firebase project settings.
- `GEMINI_API_KEY`: Your API key for Google AI Studio (for Genkit features).

### 3. Run the Development Server
To run the web application locally, use the following command:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### 4. (Optional) Run the Genkit AI Server
If your project uses Generative AI features with Genkit, you need to run the Genkit server in a **separate terminal**:

```bash
npm run genkit:dev
```

This will start the Genkit development UI, allowing you to inspect and test your AI flows.
