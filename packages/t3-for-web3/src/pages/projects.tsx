import type { NextPage } from "next";
import Layout from "../componests/Layout";
import { trpc } from "../utils/trpc";

const ProjectPage: NextPage = () => {
  const { data: projects } = trpc.project.getMyProjects.useQuery();
  return (
    <Layout>
      <div className="flex flex-col items-center gap-12">
        <h1 className="text-4xl font-bold">Projects</h1>
        {projects?.map((project, i) => (
          <h4 key={i}> {project.name}</h4>
        ))}
      </div>
    </Layout>
  );
};
export default ProjectPage;
