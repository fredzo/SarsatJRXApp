
export type Config = {

  data: Record<string, string>;
};

export let currentConfig: Config | null;

export function setConfig(newConfig:Config| null) {
  //console.log("Set current frame ", frame?.data.title);
  currentConfig = newConfig;
}

export function parseConfig(configData: string) {
    try {
        const parsed: Record<string, string> = {};
        configData.split(/\r?\n/).forEach(line => {
            const idx = line.indexOf('=');
            const key = line.slice(0, idx);
            const value = line.slice(idx + 1);
            //console.log("Config data:",key,value);
            if (key && value) parsed[key.trim()] = value.trim();
        });
        if(Object.entries(parsed).length > 0)
        {
          const newConfig: Config = {data:parsed};
          setConfig(newConfig);
        }
    } catch {}
}