'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story…',
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-surface-container-high text-on-surface font-code-sm text-sm rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
      HorizontalRule,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[45vh] outline-none font-body-lg text-on-surface leading-relaxed',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 mb-4 pb-4 border-b border-outline-variant/20 flex-wrap">
        {/* Text formatting */}
        <ToolbarButton icon="format_bold" label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon="format_italic" label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon="format_underlined" label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton icon="strikethrough_s" label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />

        <Divider />

        {/* Headings */}
        <ToolbarButton label="H1" text active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarButton label="H2" text active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="H3" text active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

        <Divider />

        {/* Lists & blocks */}
        <ToolbarButton icon="format_list_bulleted" label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon="format_list_numbered" label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton icon="format_quote" label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />

        <Divider />

        {/* Media & special */}
        <ToolbarButton icon="code_blocks" label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <ToolbarButton icon="code" label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <ToolbarButton icon="image" label="Image" onClick={addImage} />
        <ToolbarButton icon="link" label="Link" active={editor.isActive('link')} onClick={addLink} />
        <ToolbarButton icon="horizontal_rule" label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </div>

      {/* ── Editor Content ── */}
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Sub-components ──

function Divider() {
  return <div className="w-px h-6 bg-outline-variant/30 mx-1 shrink-0" />;
}

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
  text,
}: {
  icon?: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  text?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`h-8 flex items-center justify-center rounded-md border transition-all text-sm ${
        text ? 'px-2 min-w-[32px]' : 'w-8'
      } ${
        active
          ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
          : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : (
        <span className="font-label-caps text-xs">{label}</span>
      )}
    </button>
  );
}
