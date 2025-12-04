import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();


app.use(
    cors({
        origin: "http://localhost:3000", 
    })
);

app.use(express.json());

app.post("/notion/today", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const notionRes = await fetch(
            `https://api.notion.com/v1/databases/${process.env.NOTION_DB_ID}/query`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NOTION_SECRET}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify({
                    filter: {
                        property: "Do Date",
                        date: { equals: today }, 
                    },
                }),
            }
        );

        const data = await notionRes.json();
        res.status(notionRes.status).json(data);
    } catch (err) {
        console.error("Notion error:", err);
        res.status(500).json({ error: "Failed to query Notion" });
    }
});

app.patch("/notion/update-task", async(req,res) => {
    try{
        const { page_id, completionValue } = req.body;

        const updateCompletionStatus = await fetch(
            `https://api.notion.com/v1/pages/${page_id}`,
            {
                method: "PATCH",
                headers:{
                    Authorization: `Bearer ${process.env.NOTION_SECRET}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify({
                    "properties": {
                        "Done": {
                            "checkbox": completionValue,
                        },
                    },
                }),
            }
        );
        const data = await updateCompletionStatus.json();
        res.status(updateCompletionStatus.status).json(data);
        
    } catch(err){
        console.log(err);
    }
})

app.listen(4000, () => {
    console.log("Backend running on http://localhost:4000");
});
