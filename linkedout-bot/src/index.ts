import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDB } from "./db";
import { messages, usersTable, postsTable } from "./schema";
import { eq } from "drizzle-orm";
import { getEnv, type Env } from "./env";
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    text?: string;
    date: number;
  };
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  first_name?: string;
  last_name?: string;
  username?: string;
  title?: string;
}

interface TelegramSendMessageRequest {
  chat_id: number;
  text: string;
  parse_mode?: "Markdown" | "HTML";
}

interface DbError {
  message: string;
}

function parseCommand(text: string): { command: string; args: string[] } {
  const parts = text.split(" ");
  return {
    command: parts[0].toLowerCase(),
    args: parts.slice(1),
  };
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  try {
    const env = getEnv(c.env);
    c.env = env;
    await next();
  } catch (error) {
    console.error("Environment validation error:", error);
    throw new HTTPException(500, { message: "Server configuration error" });
  }
});

app.post("/webhook", async (c) => {
  try {
    const update: TelegramUpdate = await c.req.json();
    console.log("Received update:", JSON.stringify(update));

    const db = getDB(c.env.DATABASE_URL);

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text;
      const { command, args } = parseCommand(messageText);

      try {
        await db.insert(messages).values({
          chatId,
          messageText,
        });
        console.log("Message stored in database");
      } catch (dbError) {
        console.error("Error storing message in database:", dbError);
      }

      let responseText = "";

      switch (command) {
        case "/start":
          responseText =
            "Welcome to LinkedOut Bot! Use /help to see available commands.";
          break;

        case "/help":
          responseText = `Available commands:
/start - Start the bot
/help - Show this help message
/count - Show number of stored messages
/createuser <name> <age> <email> - Create a new user
/listusers - List all users
/createpost <user_id> <title> <content> - Create a new post
/userposts <user_id> - Show posts by a user
/deleteuser <user_id> - Delete a user and their posts`;
          break;

        case "/count":
          const count = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .execute();
          responseText = `You have sent ${count.length} messages that I've stored in the database!`;
          break;

        case "/createuser":
          if (args.length >= 3) {
            const [name, age, email] = args;
            try {
              const user = await db
                .insert(usersTable)
                .values({
                  name,
                  age: parseInt(age),
                  email,
                })
                .returning()
                .execute();
              responseText = `User created successfully! ID: ${user[0].id}`;
            } catch (error: unknown) {
              const dbError = error as DbError;
              responseText = `Error creating user: ${dbError.message}`;
            }
          } else {
            responseText = "Usage: /createuser <name> <age> <email>";
          }
          break;

        case "/listusers":
          const users = await db.select().from(usersTable).execute();
          responseText =
            users.length > 0
              ? users
                  .map((u) => `ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`)
                  .join("\n")
              : "No users found";
          break;

        case "/createpost":
          if (args.length >= 3) {
            const [userId, title, ...contentParts] = args;
            const content = contentParts.join(" ");
            try {
              const post = await db
                .insert(postsTable)
                .values({
                  userId: parseInt(userId),
                  title,
                  content,
                })
                .returning()
                .execute();
              responseText = `Post created successfully! ID: ${post[0].id}`;
            } catch (error: unknown) {
              const dbError = error as DbError;
              responseText = `Error creating post: ${dbError.message}`;
            }
          } else {
            responseText = "Usage: /createpost <user_id> <title> <content>";
          }
          break;

        case "/userposts":
          if (args.length >= 1) {
            const userId = parseInt(args[0]);
            const posts = await db
              .select()
              .from(postsTable)
              .where(eq(postsTable.userId, userId))
              .execute();
            responseText =
              posts.length > 0
                ? posts
                    .map(
                      (p) =>
                        `ID: ${p.id}\nTitle: ${p.title}\nContent: ${p.content}`
                    )
                    .join("\n\n")
                : "No posts found for this user";
          } else {
            responseText = "Usage: /userposts <user_id>";
          }
          break;

        case "/deleteuser":
          if (args.length >= 1) {
            const userId = parseInt(args[0]);
            try {
              await db
                .delete(usersTable)
                .where(eq(usersTable.id, userId))
                .execute();
              responseText = "User and their posts deleted successfully!";
            } catch (error: unknown) {
              const dbError = error as DbError;
              responseText = `Error deleting user: ${dbError.message}`;
            }
          } else {
            responseText = "Usage: /deleteuser <user_id>";
          }
          break;

        default:
          responseText = `Message stored in database! You said: ${messageText}`;
      }

      await sendTelegramMessage(c.env.TELEGRAM_BOT_TOKEN, {
        chat_id: chatId,
        text: responseText,
      });
    }

    return c.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Helper function to send messages to Telegram
async function sendTelegramMessage(
  botToken: string,
  data: TelegramSendMessageRequest
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Telegram API error:", errorData);
    throw new Error(
      `Telegram API error: ${response.status} ${JSON.stringify(errorData)}`
    );
  }

  return await response.json();
}

app.get("/", (c) => {
  return c.text("Telegram Bot is running!");
});

// Export the app
export default app;
