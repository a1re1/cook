import { Block } from "@blocknote/core";

export function extractSearchableText(blocks: Block[]): string {
  const extractText = (block: Block): string => {
    let text = "";

    // Extract text content from block
    if (block.content) {
      if (Array.isArray(block.content)) {
        text += block.content
          .map((item: any) => {
            if (typeof item === "string") return item;
            if (item.type === "text" && item.text) return item.text;
            if (item.text) return item.text;
            return "";
          })
          .join(" ");
      } else if (typeof block.content === "string") {
        text += block.content;
      }
    }

    // Extract text from props (for custom blocks)
    if (block.props) {
      const props = block.props as any;
      // Handle ingredients block
      if (props.items && Array.isArray(props.items)) {
        text += " " + props.items.map((item: any) =>
          `${item.quantity || ""} ${item.unit || ""} ${item.name || ""}`.trim()
        ).join(" ");
      }
      // Handle instructions block
      if (props.steps && Array.isArray(props.steps)) {
        text += " " + props.steps.map((step: any) => step.text || "").join(" ");
      }
    }

    // Recursively extract from nested blocks
    if (block.children && block.children.length > 0) {
      text += " " + block.children.map(extractText).join(" ");
    }

    return text;
  };

  return blocks
    .map(extractText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
