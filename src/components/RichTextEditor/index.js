import {
  MDXEditor,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  listsPlugin,
  tablePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import PropTypes from "prop-types";
import "./RichTextEditor.css";
import "@mdxeditor/editor/style.css";

function RichTextEditor({ query, questionNumber }) {
  return (
    <div className="rich-text-editor">
      <div className="question-container">
        <div className="question-number">{questionNumber}.</div>
        <MDXEditor
          markdown={query}
          className=""
          contentEditableClassName="view-only"
          readOnly
          plugins={[
            tablePlugin(),
            thematicBreakPlugin(),
            listsPlugin(),
            headingsPlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                txt: "text",
                html: "HTML",
                css: "CSS",
                cpp: "C,C++",
                java: "Java",
                tsx: "JavaScript",
                python: "Python",
                bash: "Bash",
                sql: "Sql",
              },
            }),
          ]}
        />
      </div>
    </div>
  );
}

RichTextEditor.propTypes = {
  query: PropTypes.string.isRequired,
  questionNumber: PropTypes.number.isRequired,
};

export default RichTextEditor;
