import useAuth from "../context/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
    </div>
  );
};

export default Dashboard;
