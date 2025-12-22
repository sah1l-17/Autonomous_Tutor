"""
Interactive Test File for Ingestion Agent

This script provides an interactive way to test the IngestionAgent with various input types.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from agents.ingestion_agent import IngestionAgent
from services.file_loader import load_text_input, load_image_bytes, load_pdf_bytes


def print_separator(char="=", length=80):
    """Print a visual separator"""
    print(char * length)


def print_result(result: dict):
    """Pretty print the ingestion result"""
    print_separator()
    print("🎯 INGESTION RESULT")
    print_separator()
    
    print("\n📚 CORE CONCEPTS:")
    if result.get("core_concepts"):
        for idx, concept in enumerate(result["core_concepts"], 1):
            print(f"  {idx}. {concept}")
    else:
        print("  (None found)")
    
    print("\n📖 DEFINITIONS:")
    if result.get("definitions"):
        for idx, definition in enumerate(result["definitions"], 1):
            print(f"  {idx}. {definition}")
    else:
        print("  (None found)")
    
    print("\n💡 EXAMPLES:")
    if result.get("examples"):
        for idx, example in enumerate(result["examples"], 1):
            print(f"  {idx}. {example}")
    else:
        print("  (None found)")
    
    print("\n📊 DIAGRAM DESCRIPTIONS:")
    if result.get("diagram_descriptions"):
        for idx, diagram in enumerate(result["diagram_descriptions"], 1):
            print(f"  {idx}. {diagram}")
    else:
        print("  (None found)")
    
    print("\n📝 CLEAN MARKDOWN:")
    print("-" * 80)
    print(result.get("clean_markdown", "(No markdown generated)"))
    print_separator()


async def test_text_input():
    """Test ingestion with text input"""
    print("\n🔤 Testing TEXT Input...")
    print_separator("-")
    
    sample_text = """
    Machine Learning Basics
    
    Machine learning is a subset of artificial intelligence that enables systems to learn 
    and improve from experience without being explicitly programmed.
    
    Types of Machine Learning:
    1. Supervised Learning - Training with labeled data
    2. Unsupervised Learning - Finding patterns in unlabeled data
    3. Reinforcement Learning - Learning through trial and error
    
    Example: A spam filter is trained on thousands of emails labeled as "spam" or "not spam".
    Over time, it learns patterns to classify new emails automatically.
    
    Key Definition: A neural network is a computing system inspired by biological neural 
    networks that constitute animal brains.
    """
    
    print("Sample text:")
    print(sample_text[:200] + "..." if len(sample_text) > 200 else sample_text)
    print()
    
    agent = IngestionAgent()
    input_data = load_text_input(sample_text)
    
    result = await agent.run(input_data)
    print_result(result)


async def test_custom_text_input():
    """Test ingestion with custom user input"""
    print("\n✏️  Testing CUSTOM Text Input...")
    print_separator("-")
    print("Enter your learning material (press Ctrl+D on Unix or Ctrl+Z on Windows when done):")
    print_separator("-")
    
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass
    
    custom_text = "\n".join(lines)
    
    if not custom_text.strip():
        print("❌ No text entered. Skipping test.")
        return
    
    agent = IngestionAgent()
    input_data = load_text_input(custom_text)
    
    result = await agent.run(input_data)
    print_result(result)


async def test_image_input():
    """Test ingestion with image input"""
    print("\n🖼️  Testing IMAGE Input...")
    print_separator("-")
    
    image_path = input("Enter path to image file (or press Enter to skip): ").strip()
    
    if not image_path:
        print("⏭️  Skipping image test.")
        return
    
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        
        agent = IngestionAgent()
        input_data = load_image_bytes(image_bytes)
        
        print(f"📸 Processing image: {image_path}")
        result = await agent.run(input_data)
        print_result(result)
    
    except FileNotFoundError:
        print(f"❌ File not found: {image_path}")
    except Exception as e:
        print(f"❌ Error processing image: {e}")


async def test_pdf_input():
    """Test ingestion with PDF input"""
    print("\n📄 Testing PDF Input...")
    print_separator("-")
    
    pdf_path = input("Enter path to PDF file (or press Enter to skip): ").strip()
    
    if not pdf_path:
        print("⏭️  Skipping PDF test.")
        return
    
    try:
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        
        agent = IngestionAgent()
        input_data = load_pdf_bytes(pdf_bytes)
        
        print(f"📑 Processing PDF: {pdf_path}")
        result = await agent.run(input_data)
        print_result(result)
    
    except FileNotFoundError:
        print(f"❌ File not found: {pdf_path}")
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")


async def interactive_menu():
    """Main interactive menu"""
    print_separator("=")
    print("🧪 INGESTION AGENT INTERACTIVE TESTER")
    print_separator("=")
    
    while True:
        print("\n📋 Choose a test option:")
        print("  1. Test with sample text")
        print("  2. Test with custom text input")
        print("  3. Test with image file")
        print("  4. Test with PDF file")
        print("  5. Run all text tests")
        print("  0. Exit")
        print_separator("-")
        
        choice = input("Enter your choice (0-5): ").strip()
        
        if choice == "1":
            await test_text_input()
        elif choice == "2":
            await test_custom_text_input()
        elif choice == "3":
            await test_image_input()
        elif choice == "4":
            await test_pdf_input()
        elif choice == "5":
            await test_text_input()
            await test_custom_text_input()
        elif choice == "0":
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")


async def main():
    """Main entry point"""
    try:
        await interactive_menu()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user. Exiting...")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🚀 Starting Ingestion Agent Interactive Test...")
    print("⚠️  Make sure your GEMINI_API_KEY is set in the .env file")
    print()
    asyncio.run(main())
