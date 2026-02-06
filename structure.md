├── src/
│   ├── index.ts              # Entry point (Starts the bot, connects to DB/SDK)
│   ├── config.ts             # Environment variables & Global constants
│   ├── handlers/             # Telegram-specific logic (Reacting to users)
│   │   ├── command.handler.ts # Maps /price, /trade to functions
│   │   ├── order.handler.ts   # Logic for order-related messages
│   │   └── menu.handler.ts    # Inline button & keyboard logic
│   ├── services/             # Pure Business Logic (Doesn't care about Telegram)
│   │   ├── polymarket.service.ts # All calls to your Poly SDK
│   │   └── gemini.service.ts     # All calls to Gemini AI
│   ├── lib/                  # Initialized Clients
│   │   ├── polymarket.ts     # 'export const poly = new SDK(...)'
│   │   └── gemini.ts         # 'export const ai = new GoogleGenAI(...)'
│   └── types/                # Shared TS Interfaces/Enums
├── scripts/                  # Standalone tools (One-off checks, CLI tools)
│   └── order-check.ts        # (No 001- prefixes, keep it clean)
├── .env                      # API Keys (Never commit this!)
├── Dockerfile                # Production packaging
└── tsconfig.json             # TS Compiler settings