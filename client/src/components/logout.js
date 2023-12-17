export default function LogOutButton({ logOut, user }) {
  const handleClick = () => {
    logOut(user);
  };
  return (
    <div>
      <button onClick={handleClick}>Log Out</button>
    </div>
  );
}
