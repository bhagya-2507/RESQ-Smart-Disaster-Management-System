const DisasterReport = require("../models/DisasterReport");
const RescueRequest = require("../models/RescueRequest");
const { generateAIResponse } = require("../services/aiService");

const citizenAIChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const userMessage = message.trim().toLowerCase();
    const citizenId = req.user.id;

    const [reports, rescueRequests] = await Promise.all([
      DisasterReport.find({
        citizen_id: citizenId,
      })
        .populate(
          "assigned_team",
          "team_name team_code leader_name contact availability"
        )
        .sort({ createdAt: -1 }),

      RescueRequest.find({
        citizen_id: citizenId,
      })
        .populate(
          "assigned_team_id",
          "team_name team_code leader_name contact availability"
        )
        .sort({ createdAt: -1 }),
    ]);

    /* =====================================================
       RESCUE REQUEST STATUS
    ===================================================== */

    if (
      userMessage.includes("request") ||
      userMessage.includes("rescue team") ||
      userMessage.includes("status")
    ) {
      if (rescueRequests.length === 0) {
        return res.json({
          success: true,
          reply:
            "I could not find any rescue request linked to your account. If you are in immediate danger, please use the Request Rescue option or contact emergency services.",
        });
      }

      const request = rescueRequests[0];

      let reply = `Your latest rescue request is currently "${request.status}".`;

      if (request.disaster_type) {
        reply += ` It is registered as a ${request.disaster_type} emergency.`;
      }

      if (request.assigned_team_id) {
        reply += ` Assigned rescue team: ${request.assigned_team_id.team_name} (${request.assigned_team_id.team_code}).`;

        if (request.assigned_team_id.availability) {
          reply += ` Team availability is currently ${request.assigned_team_id.availability}.`;
        }
      } else {
        reply +=
          " A rescue team has not been assigned to this request yet.";
      }

      if (request.status === "Resolved") {
        reply +=
          " This rescue request has been marked as resolved.";
      } else {
        reply +=
          " Please remain in a safe location and follow official emergency instructions while response is in progress.";
      }

      return res.json({
        success: true,
        reply,
      });
    }

    /* =====================================================
       REPORT STATUS
    ===================================================== */

    if (
      userMessage.includes("report") ||
      userMessage.includes("incident")
    ) {
      if (reports.length === 0) {
        return res.json({
          success: true,
          reply:
            "I could not find any disaster report linked to your account.",
        });
      }

      const report = reports[0];

      let reply = `Your latest disaster report is currently "${report.status}".`;

      if (report.priority_level) {
        reply += ` Its current priority level is ${report.priority_level}.`;
      }

      if (report.assigned_team) {
        reply += ` The assigned team is ${report.assigned_team.team_name} (${report.assigned_team.team_code}).`;
      } else {
        reply +=
          " No rescue team is currently assigned to this report.";
      }

      return res.json({
        success: true,
        reply,
      });
    }

    /* =====================================================
       IMMEDIATE EMERGENCY
    ===================================================== */

    if (
      userMessage.includes("trapped") ||
      userMessage.includes("stuck") ||
      userMessage.includes("danger") ||
      userMessage.includes("help me") ||
      userMessage.includes("save me") ||
      userMessage.includes("phasa") ||
      userMessage.includes("bachao")
    ) {
      return res.json({
        success: true,
        emergency: true,
        reply:
          "If you are in immediate danger, call 112 now if possible. Move to the safest accessible location, avoid floodwater, fire, damaged structures or live electrical wires, and keep your phone available for rescue communication.",
      });
    }

    /* =====================================================
       EMERGENCY NUMBER
    ===================================================== */

    if (
      userMessage.includes("112") ||
      userMessage.includes("emergency number") ||
      userMessage.includes("helpline")
    ) {
      return res.json({
        success: true,
        emergency: true,
        reply:
          "In India, 112 is the national emergency number for immediate emergency assistance. Share your location and clearly explain the nature of the emergency.",
      });
    }

    /* =====================================================
       AI CONTEXT
    ===================================================== */

    const aiContext = {
      latestReport: reports[0]
        ? {
            disaster_type: reports[0].disaster_type,
            severity: reports[0].severity,
            priority_level: reports[0].priority_level,
            status: reports[0].status,
            location: reports[0].location,
            city: reports[0].city,
            state: reports[0].state,
            assigned_team: reports[0].assigned_team
              ? {
                  team_name:
                    reports[0].assigned_team.team_name,
                  team_code:
                    reports[0].assigned_team.team_code,
                  availability:
                    reports[0].assigned_team.availability,
                }
              : null,
          }
        : null,

      latestRescueRequest: rescueRequests[0]
        ? {
            disaster_type:
              rescueRequests[0].disaster_type,
            severity: rescueRequests[0].severity,
            status: rescueRequests[0].status,
            location: rescueRequests[0].location,
            city: rescueRequests[0].city,
            state: rescueRequests[0].state,
            assigned_team:
              rescueRequests[0].assigned_team_id
                ? {
                    team_name:
                      rescueRequests[0].assigned_team_id
                        .team_name,
                    team_code:
                      rescueRequests[0].assigned_team_id
                        .team_code,
                    availability:
                      rescueRequests[0].assigned_team_id
                        .availability,
                  }
                : null,
          }
        : null,
    };

    /* =====================================================
       LOCAL AI - OLLAMA
    ===================================================== */

    const aiResult = await generateAIResponse({
      message: message.trim(),
      context: aiContext,
    });

    return res.json({
      success: true,
      reply: aiResult.reply,
      metadata: aiResult.metadata || null,
    });

  } catch (error) {
    console.error(
      "Citizen AI error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to process AI request.",
    });
  }
};

module.exports = {
  citizenAIChat,
};