import { Project, racksProjectManager } from "@smart-contracts";
import { router, protectedProcedure } from "../trpc";

export const projectRouter = router({
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await racksProjectManager.getAllProjects();

    const projectContracts = projects.map((project) => Project(project));

    const projectOwns = projectContracts.filter(async (project) => {
      const owner = await project.owner();
      return owner === ctx.user.address;
    });

    const projectsRegistered = await ctx.prisma.project.findMany({
      where: {
        address: {
          in: projectOwns.map((project) => project.address),
        },
      },
      include: {
        Members: { select: { User: true } },
      },
    });

    const projectsData = projectsRegistered.map((project) => ({
      registered: true,
      members: project.Members.map((member) => member.User),
      name: project.name,
      description: project.description,
    }));

    return projectsData;
  }),
});
