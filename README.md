<a href="">
  <img alt="AI Pod Chrome Extension" src="./ai-pod-chrome-extension.png">
  <h1 align="center">AI Pod</h1>  
</a>

<p align="center">
  A Chrome extension that generates podcast-style audio summaries of web pages using the AI SDK and OpenAI text-to-speech.
</p>

</div>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-provider"><strong>Model provider</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy your own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [AI SDK](https://ai-sdk.dev/)
  - Advanced AI integration for content analysis and podcast generation
  - Real-time web page content processing and summarization
- [OpenAI Text-to-Speech](https://openai.com/)
  - High-quality voice generation for podcast-style audio
  - Natural-sounding speech synthesis for engaging content

## Model provider

This extension ships with [Openai](https://openai.com/) provider as the default. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [Ollama](https://ollama.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

- Podcast Model (`gpt-4o-mini`): Versatile GPT-4.1 model for content understanding and summarization
- Transcribe Model (`gpt-4o-mini-tts`): Specialized for generating high-quality, natural-sounding speech from text

The extension leverages these models through the [OpenAI Agent SDK](https://openai.github.io/openai-agents-js/guides/voice-agents/) to create a sophisticated voice-driven code generation experience with real-time audio processing and intelligent agent handoffs.

## Deploy your own

You can deploy your own version of AI Pod to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnicoalbanese%2Fai-sdk-chrome-extension-template&env=OPENAI_API_KEY&envDescription=Environment+variables+for+the+AI+SDK+Page+Podcaster.+OPENAI_API_KEY+is+required+for+text-to-speech+generation.&project-name=ai-sdk-page-podcaster&repository-name=ai-sdk-page-podcaster)

## Running locally

You will need to use the environment variables to run AI Pod. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your AI accounts.

1. **Server Setup**
   ```bash
   cd server
   bun install
   ```

2. **Add environment variables**
   - Create a `.env` file in the `server` directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

3. **Start the server**
   ```bash
   bun dev
   ```

4. **Load the extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` directory

Your server should now be running and the extension will be loaded in Chrome.