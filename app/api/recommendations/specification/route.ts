import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const topics = body.topics;
  const subjectName = body.subjectName;

  if (!topics || !Array.isArray(topics)) {
    return NextResponse.json(
      { error: "Invalid topics data input" },
      { status: 400 }
    );
  }

  let topWeighting = 0;
  let topInfo = "";
  let topID = "";

  function calculateWeighting(
    common: boolean,
    difficult: boolean,
    confidence: number,
    sessions: number
  ) {
    let tempWeighting = 0;

    if (common === true) {
      tempWeighting += 0.4;
    }
    if (difficult === true) {
      tempWeighting += 0.4;
    }

    if (sessions === 0) {
      tempWeighting += 0.3;
    } else if (sessions <= 3) {
      tempWeighting += 0.2;
    } else if (sessions <= 5) {
      tempWeighting += 0.1;
    }

    if (confidence === 0) {
      // If no confidence is set, it is treated as amber confidence
      confidence = 2;
    }

    return tempWeighting + ((4 - confidence) / 10); // Confidence of 1 is red, 2 is amber, and 3 is green - inverted so red confidence adds more weight
  }

  for (const entry of topics) {
    let weighting = 0;

    weighting = calculateWeighting(
      entry.common,
      entry.difficult,
      entry.confidence,
      entry.sessions
    );

    if (weighting > topWeighting) {
      topWeighting = weighting;
      topID = entry.id;
    }
  }

  if (topID) {
    type Topic = {
      id: string;
      topic: string;
      topic_name: string;
      description: string | null;
      paper: string;
      common: boolean;
      difficult: boolean;
      confidence: number;
      sessions: number;
    };

    const topEntry = topics.find((entry: Topic) => entry.id === topID);

    const combinedRandom = Math.floor(Math.random() * 3); // Result is either 0 or 1 or 2
    let basedOnText = "";

    if (combinedRandom === 0) {
      basedOnText = `all of ${subjectName}'s topics`;
    } else if (combinedRandom === 1) {
      basedOnText = `all of ${subjectName}'s ${topics.length} topics`;
    } else if (combinedRandom === 2) {
      basedOnText =
        "the difficulty, rarity, and your confidence/sessions of each topic";
    }

    const commonTop = topEntry.common;
    const difficultTop = topEntry.difficult;
    const confidenceTop = topEntry.confidence;
    const sessionsTop = topEntry.sessions;

    let commonDifficultyText = "";
    let confidenceSessionsText = "";
    let confidenceColour = "";
    let sessionsOption = "";
    let extraInfo = "";

    if (commonTop && difficultTop) {
      if (combinedRandom === 0) {
        commonDifficultyText = ", which is both a common and difficult topic";
      } else if (combinedRandom === 1) {
        commonDifficultyText = `, which is a difficult and common topic for ${subjectName}`;
      } else if (combinedRandom === 2) {
        commonDifficultyText = `, which is both a common and difficult topic for ${subjectName} paper ${topEntry.paper}`;
      }
    } else if (commonTop) {
      if (combinedRandom === 0) {
        commonDifficultyText = ", which is a common topic";
      } else if (combinedRandom === 1) {
        commonDifficultyText = `, which is a common topic for ${subjectName}`;
      } else if (combinedRandom === 2) {
        commonDifficultyText = `, which is a common topic for ${subjectName} paper ${topEntry.paper}`;
      }
    } else if (difficultTop) {
      if (combinedRandom === 0) {
        commonDifficultyText = ", which is a difficult topic";
      } else if (combinedRandom === 1) {
        commonDifficultyText = `, which is a difficult topic for ${subjectName}`;
      } else if (combinedRandom === 2) {
        commonDifficultyText = `, which is a difficult topic for ${subjectName} paper ${topEntry.paper}`;
      }
    }

    if (confidenceTop === 1) {
      confidenceColour = "red";
    } else if (confidenceTop === 2) {
      confidenceColour = "amber";
    } else if (confidenceTop === 3) {
      confidenceColour = "green";
    }

    if (combinedRandom === 0 || combinedRandom === 1) {
      sessionsOption = sessionsTop;
    } else if (combinedRandom === 2) {
      if (sessionsTop === 0) {
        sessionsOption = "no";
      } else if (sessionsTop === 1) {
        sessionsOption = "one";
      } else if (sessionsTop === 2) {
        sessionsOption = "a couple";
      } else {
        sessionsOption = "a few";
      }
    }

    if (confidenceColour !== "green" && confidenceTop !== 0) {
      confidenceSessionsText = ` This topic is ${
        commonDifficultyText !== "" ? "also " : ""
      }in the ${confidenceColour} confidence column ${
        sessionsTop <= 3
          ? `and currently ${
              sessionsTop === 0 ? "" : "only "
            }has ${sessionsOption} revision session${
              sessionsTop === 1 ? "" : "s"
            }`
          : "suggesting it needs more practice"
      }.`;
    } else {
      if (sessionsTop <= 3) {
        confidenceSessionsText = ` The topic ${
          commonDifficultyText !== "" ? "also " : ""
        }currently has ${
          sessionsTop === 0 ? "" : "only "
        }${sessionsOption} revision session${
          sessionsTop === 1 ? "" : "s"
        }, suggesting it may need more practice.`;
      }
    }

    if (combinedRandom === 0) {
      extraInfo = `To assist you, check out some of the resources available for ${subjectName} on the 'resources' page.`;
    } else if (combinedRandom === 1) {
      extraInfo = `After this, you could complete a paper ${topEntry.paper} past paper from the past paper hub to test your knowledge.`;
    } else if (combinedRandom === 2) {
      extraInfo = `To assist you, check out some of the resources available for ${subjectName} on the 'resources' page. After this, you could complete a paper ${topEntry.paper} past paper from the past paper hub to test your knowledge.`;
    }

    if (topEntry) {
      topInfo = `Based on ${basedOnText}, we recommend revising topic ${topEntry.topic}: "${topEntry.topic_name}"${commonDifficultyText}.${confidenceSessionsText} ${extraInfo}`;
    } else {
      return NextResponse.json(
        { error: "No recommendations available at this time" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "No recommendations available at this time" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    topInfo,
    topID,
  });
}
