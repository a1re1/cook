"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { Block, BlockNoteEditor } from "@blocknote/core";
import { useEffect } from "react";

interface RecipeEditorProps {
  initialContent?: string;
  onChange: (content: string, editor: BlockNoteEditor) => void;
  editable?: boolean;
}

export function RecipeEditor({
  initialContent,
  onChange,
  editable = true
}: RecipeEditorProps) {
  // Parse initial content
  let parsedContent: Block[] | undefined;
  if (initialContent) {
    try {
      parsedContent = JSON.parse(initialContent);
    } catch (error) {
      console.error("Failed to parse initial content:", error);
    }
  }

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
  });

  useEffect(() => {
    if (!editable) {
      editor.isEditable = false;
    }
  }, [editor, editable]);

  const handleChange = () => {
    const blocks = editor.document;
    const content = JSON.stringify(blocks);
    onChange(content, editor);
  };

  return (
    <div className="recipe-editor border rounded-lg">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
