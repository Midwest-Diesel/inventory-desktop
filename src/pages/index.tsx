import { Layout } from "@/components/Layout";
import DashboardContainer from "@/containers/Dashboard/DashboardContainer";


export default function Home() {
  return (
    <Layout title="Dashboard">
      <DashboardContainer />
    </Layout>
  );
}
