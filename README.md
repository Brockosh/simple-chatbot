# Simple Chatbot

A web-based chatbot application powered by OpenAI's API, built with Express.js and vanilla JavaScript.

## Features

- 💬 Interactive chat interface
- 🤖 OpenAI GPT integration
- 🌐 Cross-origin resource sharing (CORS) enabled
- ⚡ Lightweight Express.js backend
- 🚀 Ready for Vercel deployment

## Local Development

### Prerequisites

- Node.js (>=18.0.0)
- OpenAI API key

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Brockosh/simple-chatbot.git
   cd simple-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:** http://localhost:3000

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Brockosh/simple-chatbot)

### Manual Deployment

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Node.js project

2. **Set Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `OPENAI_API_KEY` with your actual API key
   - Deploy

3. **That's it!** Your chatbot is now live.

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable when prompted
# OPENAI_API_KEY: your_actual_api_key_here
```

## Project Structure

```
simple-chatbot/
├── public/
│   └── index.html          # Frontend interface
├── server.js               # Express.js server
├── vercel.json            # Vercel deployment configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## API Endpoints

- `GET /` - Serves the main chat interface
- `POST /chat` - Processes chat messages and returns AI responses

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript
- **AI:** OpenAI GPT API
- **Deployment:** Vercel
- **CORS:** Enabled for cross-origin requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.