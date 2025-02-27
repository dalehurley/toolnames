import { useState } from "react";
import {
  generateRandomNumbers,
  LOTTERY_CONFIGS,
  LotteryConfig,
} from "../utils/lotteryUtils";

const LotteryPicker = () => {
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [customConfig, setCustomConfig] = useState<LotteryConfig>({
    name: "Custom",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50,
    },
  });
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [isCustom, setIsCustom] = useState(false);

  const handleConfigChange = (configKey: string) => {
    setSelectedConfig(configKey);
    setIsCustom(configKey === "custom");
    // Clear previously generated numbers
    setMainNumbers([]);
    setBonusNumbers([]);
  };

  const handleCustomConfigChange = (
    field: "count" | "min" | "max",
    value: number,
    numberType: "main" | "bonus"
  ) => {
    if (numberType === "main") {
      setCustomConfig({
        ...customConfig,
        mainNumbers: {
          ...customConfig.mainNumbers,
          [field]: value,
        },
      });
    } else {
      setCustomConfig({
        ...customConfig,
        bonusNumbers: {
          ...(customConfig.bonusNumbers || { count: 1, min: 1, max: 10 }),
          [field]: value,
        },
      });
    }
  };

  const generateNumbers = () => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];

    // Generate main numbers
    const main = generateRandomNumbers(
      config.mainNumbers.count,
      config.mainNumbers.min,
      config.mainNumbers.max
    );
    setMainNumbers(main);

    // Generate bonus numbers if applicable
    if (config.bonusNumbers) {
      const bonus = generateRandomNumbers(
        config.bonusNumbers.count,
        config.bonusNumbers.min,
        config.bonusNumbers.max
      );
      setBonusNumbers(bonus);
    } else {
      setBonusNumbers([]);
    }
  };

  const toggleBonusNumbers = () => {
    if (customConfig.bonusNumbers) {
      // Create a new object without the bonusNumbers property
      const newConfig = { ...customConfig };
      delete newConfig.bonusNumbers;
      setCustomConfig(newConfig);
    } else {
      setCustomConfig({
        ...customConfig,
        bonusNumbers: {
          count: 1,
          min: 1,
          max: 10,
        },
      });
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Lottery Number Picker</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Lottery Type
        </label>
        <select
          value={selectedConfig}
          onChange={(e) => handleConfigChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {Object.entries(LOTTERY_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {isCustom && (
        <div className="mb-4 p-4 border rounded">
          <h3 className="font-medium mb-2">Custom Configuration</h3>

          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Main Numbers</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs">Count</label>
                <input
                  type="number"
                  value={customConfig.mainNumbers.count}
                  onChange={(e) =>
                    handleCustomConfigChange(
                      "count",
                      parseInt(e.target.value),
                      "main"
                    )
                  }
                  min="1"
                  className="w-full p-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs">Min</label>
                <input
                  type="number"
                  value={customConfig.mainNumbers.min}
                  onChange={(e) =>
                    handleCustomConfigChange(
                      "min",
                      parseInt(e.target.value),
                      "main"
                    )
                  }
                  min="1"
                  className="w-full p-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs">Max</label>
                <input
                  type="number"
                  value={customConfig.mainNumbers.max}
                  onChange={(e) =>
                    handleCustomConfigChange(
                      "max",
                      parseInt(e.target.value),
                      "main"
                    )
                  }
                  min={
                    customConfig.mainNumbers.min +
                    customConfig.mainNumbers.count -
                    1
                  }
                  className="w-full p-1 border rounded"
                />
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasBonusNumbers"
                checked={!!customConfig.bonusNumbers}
                onChange={toggleBonusNumbers}
                className="mr-2"
              />
              <label htmlFor="hasBonusNumbers" className="text-sm font-medium">
                Include Bonus Numbers
              </label>
            </div>
          </div>

          {customConfig.bonusNumbers && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Bonus Numbers</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs">Count</label>
                  <input
                    type="number"
                    value={customConfig.bonusNumbers.count}
                    onChange={(e) =>
                      handleCustomConfigChange(
                        "count",
                        parseInt(e.target.value),
                        "bonus"
                      )
                    }
                    min="1"
                    className="w-full p-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs">Min</label>
                  <input
                    type="number"
                    value={customConfig.bonusNumbers.min}
                    onChange={(e) =>
                      handleCustomConfigChange(
                        "min",
                        parseInt(e.target.value),
                        "bonus"
                      )
                    }
                    min="1"
                    className="w-full p-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs">Max</label>
                  <input
                    type="number"
                    value={customConfig.bonusNumbers.max}
                    onChange={(e) =>
                      handleCustomConfigChange(
                        "max",
                        parseInt(e.target.value),
                        "bonus"
                      )
                    }
                    min={
                      customConfig.bonusNumbers.min +
                      customConfig.bonusNumbers.count -
                      1
                    }
                    className="w-full p-1 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={generateNumbers}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
      >
        Generate Numbers
      </button>

      {(mainNumbers.length > 0 || bonusNumbers.length > 0) && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Your Lucky Numbers</h3>

          <div className="flex flex-wrap gap-2 mb-2">
            {mainNumbers.map((number, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800"
              >
                {number}
              </div>
            ))}
          </div>

          {bonusNumbers.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Bonus Numbers:</p>
              <div className="flex flex-wrap gap-2">
                {bonusNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LotteryPicker;
