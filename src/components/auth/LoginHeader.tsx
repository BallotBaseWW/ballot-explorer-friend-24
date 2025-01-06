interface LoginHeaderProps {
  heading: string;
  text: string;
}

const LoginHeader = ({ heading, text }: LoginHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-foreground mb-3">
        {heading}
      </h2>
      <p className="text-lg text-muted-foreground">
        {text}
      </p>
    </div>
  );
};

export default LoginHeader;