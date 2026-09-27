const generateAIResponse = async ({ message, context = {} }) => {
  try {
    const text = String(message || "").trim().toLowerCase();

    if (!text) {
      return {
        success: false,
        reply: "Please enter your question.",
      };
    }

    // EMERGENCY
    if (
      text.includes("trapped") ||
      text.includes("stuck") ||
      text.includes("bachao") ||
      text.includes("phasa") ||
      text.includes("emergency")
    ) {
      return {
        success: true,
        reply:
          "If you are in immediate danger, call 112 immediately. Move to the safest accessible location and stay away from damaged buildings, floodwater, fire and live electrical wires.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "emergency",
        },
      };
    }

    // FLOOD
    if (
      text.includes("flood") ||
      text.includes("flooding") ||
      text.includes("paani") ||
      text.includes("baarish")
    ) {
      return {
        success: true,
        reply:
          "During flooding, move to higher and safer ground. Do not walk or drive through moving floodwater. Stay away from electrical wires and follow official evacuation instructions. If you are in immediate danger, call 112.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "flood",
        },
      };
    }

    // EARTHQUAKE
    if (
      text.includes("earthquake") ||
      text.includes("earth quake") ||
      text.includes("bhukamp")
    ) {
      return {
        success: true,
        reply:
          "During an earthquake, Drop, Cover and Hold On. Stay away from windows and heavy objects. If you are indoors, stay where you are until the shaking stops. Afterward, move carefully away from damaged structures.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "earthquake",
        },
      };
    }

    // FIRE
    if (
      text.includes("fire") ||
      text.includes("aag") ||
      text.includes("smoke")
    ) {
      return {
        success: true,
        reply:
          "If there is a fire, raise the alarm and move away from the affected area. Stay low if there is smoke and use the safest available exit. Do not use elevators. If you are trapped or the fire is spreading, call 112.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "fire",
        },
      };
    }

    // FIRST AID
    if (
      text.includes("first aid") ||
      text.includes("bleeding") ||
      text.includes("injury") ||
      text.includes("injured") ||
      text.includes("chot")
    ) {
      return {
        success: true,
        reply:
          "For serious bleeding, apply firm continuous pressure with clean cloth or gauze. Keep the injured person still and calm. Do not remove deeply embedded objects. For severe injuries, seek medical assistance and call 112.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "first-aid",
        },
      };
    }

    // REPORT STATUS
    if (
      text.includes("report status") ||
      text.includes("my report") ||
      text.includes("report ka status")
    ) {
      if (context.latestReport) {
        const report = context.latestReport;

        return {
          success: true,
          reply:
            `Your latest disaster report is currently "${report.status}". ` +
            `Priority level: ${
              report.priority_level || "Not assigned"
            }. ` +
            `Location: ${
              report.location || "Not available"
            }.`,
          metadata: {
            source: "RESQ Database",
            type: "report-status",
          },
        };
      }

      return {
        success: true,
        reply: "I could not find a disaster report linked to your account.",
        metadata: {
          source: "RESQ Database",
          type: "report-status",
        },
      };
    }

    // RESCUE REQUEST STATUS
    if (
      text.includes("rescue request") ||
      text.includes("rescue status") ||
      text.includes("rescue team status")
    ) {
      if (context.latestRescueRequest) {
        const request = context.latestRescueRequest;

        let reply =
          `Your latest rescue request is currently "${request.status}".`;

        if (request.disaster_type) {
          reply += ` Emergency type: ${request.disaster_type}.`;
        }

        if (request.assigned_team) {
          reply += ` Assigned team: ${request.assigned_team.team_name}.`;
        } else {
          reply += " A rescue team has not been assigned yet.";
        }

        return {
          success: true,
          reply,
          metadata: {
            source: "RESQ Database",
            type: "rescue-status",
          },
        };
      }

      return {
        success: true,
        reply:
          "I could not find a rescue request linked to your account. If you are in immediate danger, call 112.",
        metadata: {
          source: "RESQ Database",
          type: "rescue-status",
        },
      };
    }

    // GENERAL SAFETY
    if (
      text.includes("safe") ||
      text.includes("safety") ||
      text.includes("survive")
    ) {
      return {
        success: true,
        reply:
          "Stay calm and move away from immediate hazards. Keep your phone charged, follow official emergency instructions, avoid damaged structures and dangerous electrical areas, and keep your location available for emergency communication. For immediate danger, call 112.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "general-safety",
        },
      };
    }

    // GREETING
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey" ||
      text.includes("good morning") ||
      text.includes("good evening")
    ) {
      return {
        success: true,
        reply:
          "Hello! I'm ResQ AI. I can help you with disaster safety, first aid, emergency guidance, and your RESQ report or rescue request status.",
        metadata: {
          source: "RESQ Safety Engine",
          type: "greeting",
        },
      };
    }

    // DEFAULT
    return {
      success: true,
      reply:
        "I can help with flood safety, earthquake safety, fire emergencies, first aid, emergency guidance, and your RESQ report or rescue request status. Please describe your situation.",
      metadata: {
        source: "RESQ Safety Engine",
        type: "general",
      },
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);

    return {
      success: false,
      reply:
        "ResQ AI is temporarily unavailable. If this is an immediate emergency, please call 112.",
      metadata: {
        source: "RESQ Safety Engine",
        type: "error",
      },
    };
  }
};

module.exports = {
  generateAIResponse,
};