const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="message-bubble message-bot inline-flex items-center">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;