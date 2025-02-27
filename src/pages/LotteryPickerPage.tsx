import LotteryPicker from "@/components/LotteryPicker";

const LotteryPickerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lottery Number Picker</h1>
      <p className="mb-6 text-gray-600 max-w-3xl">
        Generate random lottery numbers for popular games like Powerball, Mega
        Millions, or create your own custom lottery format. This tool helps you
        generate truly random numbers for lottery games or any random drawing.
      </p>

      <LotteryPicker />
    </div>
  );
};

export default LotteryPickerPage;
