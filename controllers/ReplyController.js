/* require dependencies */
const { Issue, Flair, User, Project, ProjectMember, Reply } = require("../models");
const replyValidity = require("./validation/ReplyValidator");

/* controller */
class ReplyController {

    static async createReply(req, res, next) {
        const { content } = req.body;
        const { user_id } = req.session;
        const { project_id, issue_id } = req.params;

        const projectMember = await ProjectMember.findOne({
            where: { user_id: req.session.user_id, project_id: project_id }
        })

        if (!projectMember) {
            const project = await Project.findOne({ where: { id: project_id } });
            if (!project) return res.status(404).json({ message: "No project exists with this id." });
            else if (project.owner !== req.session.user_id)
                return res.status(403).status({ message: "Not authorized to create a reply for this issue." });         
        }

        let replyValidation = replyValidity(content);

        if (replyValidation)
            return res.status(replyValidation.status).json({ message: replyValidation.message });

        const reply = await Reply.create({
            content: content,
            author: user_id,
            issue_id: issue_id,
        });

        return res.status(201).json({
            message: "Reply created successfully.",
            resource: {
                id: reply.id,
                content: reply.content,
                author: user_id,
                issue_id: issue_id,
                createdAt: reply.createdAt,
            }
        });
    }

    static async getReplies(req, res, next) {
        const { project_id, issue_id } = req.params;

        const projectMember = await ProjectMember.findOne({
            where: { user_id: req.session.user_id, project_id: project_id }
        })

        if (!projectMember) {
            const project = await Project.findOne({ where: { id: project_id } });
            if (!project) return res.status(404).json({ message: "No project exists with this id." });
            else if (project.owner !== req.session.user_id)
                return res.status(403).status({ message: "Not authorized to retrieve replies for this issue." });         
        }

        const replies = await Reply.findAll({
            where: { issue_id: issue_id },
            include: [{ 
                model: User,
                attributes: ["id", "username", "first_name", "last_name"]
            }],
            order: [["createdAt", "ASC"]]
        });

        return res.status(200).json({
            replies: replies.map((reply) => {
                return {
                    id: reply.id,
                    content: reply.content,
                    createdAt: reply.createdAt,
                    updatedAt: reply.updatedAt,
                    issue_id: issue_id,
                    author: {
                        id: reply.user.id,
                        username: reply.user.username,
                        first_name: reply.user.first_name,
                        last_name: reply.user.last_name,
                    },
                }
            })
        });
    }

}

module.exports = ReplyController;