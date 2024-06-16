import * as c from "ansi-colors";

type AnsiColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "greenBright"
  | "blueBright"
  | "magentaBright"
  | "yellowBright"
  | "redBright"
  | "cyanBright"
  | "whiteBright"
  | "grayBright";

function logResults(
  results: any,
  contextLabel: string,
  color: AnsiColor
): void {
  console.log(c[color](`[${contextLabel}] - results`));
  console.log(" ");
  console.log(results);
  console.log(" ");
  console.log(c[color](` ---------- [${contextLabel}] ---------- ` ));
  console.log(" ");
}

interface ToolCall {
  function: {
    name: string;
  };
}
function logInit(
  contextLabel: string,
  toolCalls?: ToolCall[],
  color: keyof typeof c = "yellowBright"
): void {
  console.log(" ")
  console.log(c[color](` ---------- [${contextLabel}] ---------- ` ));
  console.log(" ")

  if (toolCalls && toolCalls.length > 0) {
    console.log(
      c[color](`[${contextLabel}] - tool calls:`),
      toolCalls?.map((tc) => tc.function.name)
    );
  } else {
    console.log(c[color](`[${contextLabel}] - tool calls:`), "None");
  }
}

export { logResults, logInit };
