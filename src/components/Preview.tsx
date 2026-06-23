import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import React from "react";

interface PreviewProps {
  code: string;
  viewMode: "preview" | "code";
}

export function Preview({ code, viewMode }: PreviewProps) {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lovable Clone Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Ensure full height */
      html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  return (
    <div className="flex-1 w-full relative">
      <div className="absolute inset-0 overflow-hidden">
        <SandpackProvider
          template="react-ts"
          theme="dark"
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              "date-fns": "latest",
              "recharts": "latest"
            },
          }}
          files={{
            "/App.tsx": {
              code: code,
              active: true,
            },
            "/public/index.html": {
              code: htmlTemplate,
            },
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          style={{ height: "100%", width: "100%" }}
        >
          <SandpackLayout className="!h-full !rounded-none !border-none" style={{ height: "100%" }}>
            {viewMode === "code" ? (
              <SandpackCodeEditor
                showLineNumbers={true}
                className="!h-full overflow-y-auto"
                style={{ height: "100%" }}
                wrapContent={true}
              />
            ) : (
              <SandpackPreview className="!h-full" showRefreshButton={true} showOpenInCodeSandbox={false} />
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}

