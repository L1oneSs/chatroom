interface WorkspaceIdPageProps {
    params: {
        workspaceId: string;
    }
}
const WorkspaceIdPage = ({params} : WorkspaceIdPageProps) => {
    return (
        <div>
            <h1>WorkspaceIdPage: {params.workspaceId}</h1>
        </div>
    )
}

export default WorkspaceIdPage;