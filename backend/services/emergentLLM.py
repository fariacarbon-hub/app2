#!/usr/bin/env python3
import os
import sys
import json
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Import error: {str(e)}"}))
    sys.exit(1)

async def process_chat(messages_json):
    try:
        # Parse messages
        messages = json.loads(messages_json)
        
        # Get API key
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            return {"success": False, "error": "EMERGENT_LLM_KEY not found"}
        
        # Extract system message and user messages
        system_message = ""
        conversation_history = []
        user_message_text = ""
        
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            elif msg["role"] == "user":
                user_message_text = msg["content"]
            elif msg["role"] == "assistant":
                conversation_history.append(msg["content"])
        
        # Initialize chat with Emergent LLM
        chat = LlmChat(
            api_key=api_key,
            session_id=f"user_session_{hash(str(messages))}",
            system_message=system_message or "Você é YOU, um gêmeo IA empático e inteligente. Responda sempre em português brasileiro de forma natural e acolhedora."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=user_message_text)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "response": response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Chat processing error: {str(e)}"
        }

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No messages provided"}))
        return
    
    messages_json = sys.argv[1]
    result = await process_chat(messages_json)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())