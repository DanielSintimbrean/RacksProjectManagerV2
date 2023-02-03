import { Project, racksProjectManager } from "@smart-contracts";
import { router, protectedProcedure } from "../trpc";

export const projectRouter = router({
  getMyProjects: protectedProcedure.query(async ({}) => {
    const projects = await racksProjectManager.getAllProjects();

    const projectContracts = projects.map((project) => Project(project));

    const projectData = await Promise.all(
      projectContracts.map((project) => project.getName())
    );

    return projectData;
  }),
});
