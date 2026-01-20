import { before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";

let unpatches: Function[] = [];

const replaceLinks = (content: string): string => {
  return content.replace(
    /(https?:\/\/)(?:mobile\.)?(twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)(\/[a-z]+\/\d+)?(\?.*)?/gi,
    (match, protocol, domain, username, statusId, mediaPath = "", query = "") => {
      const fixerDomain = domain.includes("twitter") ? "fxtwitter.com" : "fixupx.com";
      return `${protocol}${fixerDomain}/${username}/status/${statusId}${mediaPath}${query}`;
    }
  );
};

export default {
  onLoad: () => {
    const MessageActions = findByProps("sendMessage", "editMessage");
    if (!MessageActions) return;

    unpatches.push(
      before("sendMessage", MessageActions, (args) => {
        const [, message] = args;
        if (message?.content) {
          message.content = replaceLinks(message.content);
        }
      })
    );

    unpatches.push(
      before("editMessage", MessageActions, (args) => {
        const [, , message] = args;
        if (message?.content) {
          message.content = replaceLinks(message.content);
        }
      })
    );
  },
  onUnload: () => {
    unpatches.forEach((unpatch) => unpatch());
  },
};
