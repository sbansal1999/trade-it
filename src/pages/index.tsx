import { trpc } from "../utils/trpc";

export default function IndexPage() {
  const mutation = trpc.users.createUser.useMutation();

  const data = {
    password: "Bansal@23",
    firstName: "Satyam",
    lastName: "Bansal",
    dateOfBirth: "1999-08-23T00:00:00Z",
    email: "sbansal1999@gmail.com",
  };

  const handleRegister = async () => {
    mutation.mutate(data);
  };

  if (mutation.error)
    return <div>Something went wrong {mutation.error.message}</div>;

  if (mutation.isLoading) return <div>Loading data...</div>;

  return (
    <>
      <div>
        <button onClick={handleRegister}>Register</button>
        <div>
          <h3>
            User Data:
            {JSON.stringify(data)}
          </h3>
        </div>

        <div>
          <h3>
            Response from API:
            {JSON.stringify(mutation.data)}
          </h3>
        </div>
      </div>
    </>
  );
}
