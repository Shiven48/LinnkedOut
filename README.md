### 1. Prerequisites

- Node.js (Latest LTS)
- Docker (Required for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed globally

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd LinnkedOut
npm install
```

### 3. Environment Configuration

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Refer to the [Environment Variables](#-environment-variables) section for details.

### 4. Database Setup

Start the local Supabase environment and apply migrations:

```bash
# Start Supabase services (requires Docker)
supabase start

# Apply migrations
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Environment Variables

The application requires several environment variables to function correctly. These are defined in `.env.example`.

### Core

- `NODE_ENV`: Current environment (`development`, `production`).
- `REMOTE_DATABASE_URL`: Connection string for the PostgreSQL database.
- `NEXT_PUBLIC_API_URL`: Base URL for the public API.

### Authentication (Clerk)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key.

### AI & Embeddings

- `GEMINI_API_KEY`: Google Gemini API for transcription and analysis.
- `VOYAGE_API_KEY`: Voyage AI for high-quality embeddings.
- `GROQ_API_KEY`: Groq API for fast LLM inference.

### Integrations

- **Reddit**: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`, etc.
- **YouTube**: `YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, and OAuth tokens.

---

## Developer Guide: Supabase & Drizzle

This project uses a hybrid approach for database management, leveraging the strengths of both **Supabase** and **Drizzle ORM**.

### Responsibility Segregation

| Feature                  | Handled By   | Why?                                                                                            |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| **Schema Definition**    | Drizzle ORM  | Type-safe schema definition in TypeScript as the single source of truth.                        |
| **Migration Generation** | Drizzle Kit  | Automatically generates SQL migration files from TypeScript schema changes.                     |
| **Migration Execution**  | Supabase CLI | Ensures migrations are handled by the same tool that manages Auth, Storage, and Edge Functions. |
| **Database Hosting**     | Supabase     | Managed PostgreSQL with vector support and built-in scaling.                                    |
| **Type Safety**          | Drizzle ORM  | Provides full end-to-end type safety for database queries.                                      |

### Database Workflow

When you need to change the database schema:

1.  **Modify Schema**: Edit the TypeScript files in `src/server/db/schema.ts`.
2.  **Generate Migration**: Create a new SQL migration file:
    ```bash
    npm run db:generate
    ```
    This generates a new `.sql` file in `supabase/migrations`.
3.  **Apply Migration**: Apply the changes to your local or remote database:
    ```bash
    npm run db:migrate  # Local: supabase migration up
    # OR
    npm run db:push     # Remote: supabase db push
    ```
4.  **Sync Types (Optional)**: If you make manual changes via the Supabase Dashboard, use:
    ```bash
    npm run db:pull
    ```

### Useful Scripts

- `npm run db:studio`: Opens Drizzle Studio to explore and edit data visually.
- `supabase status`: Checks the health of local Supabase services.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
