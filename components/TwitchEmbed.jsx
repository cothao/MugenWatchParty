import React, { useEffect } from "react";

const TwitchEmbed = ({ channel = "collinthao" }) => {
  useEffect(() => {
    // Dynamically load the Twitch embed script
    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.async = true;

    // Once the script is loaded, create the player
    script.onload = () => {
      if (window.Twitch && window.Twitch.Player) {
        new window.Twitch.Player("twitch-embed", {
          channel: channel,
          width: "100%",   // optional
          height: "480",   // optional
        });
      }
    };

    document.body.appendChild(script);

    // Clean up script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [channel]);

  return <div id="twitch-embed"></div>;
};

export default TwitchEmbed;
