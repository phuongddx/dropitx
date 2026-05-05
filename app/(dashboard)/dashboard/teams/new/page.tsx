import { CreateTeamForm } from "@/components/create-team-form";
import { PageHeader } from "@/components/page-header";

export default function NewTeamPage() {
  return (
    <div className="max-w-[680px] mx-auto">
      <PageHeader
        eyebrow="/dashboard/teams/new"
        title="Create Team"
        subtitle="Set up a new team to collaborate with others"
      />
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <CreateTeamForm />
      </div>
    </div>
  );
}
