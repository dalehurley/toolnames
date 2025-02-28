import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";

const UnitConverterPage = () => {
  const { conversionType } = useParams<{ conversionType: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate the conversion type and update the metadata
    if (!conversionType) {
      // If no conversion type is specified, redirect to the main converter
      navigate("/converters/unit-converter");
      return;
    }

    // Map conversion types to user-friendly titles and descriptions
    const conversionTypeMap: Record<
      string,
      { title: string; description: string }
    > = {
      length: {
        title:
          "Length Unit Converter | Convert Miles, Kilometers, Meters & More",
        description:
          "Free online length converter tool. Convert between miles, kilometers, meters, feet, inches and other length units instantly. No downloads required.",
      },
      mass: {
        title:
          "Mass & Weight Converter | Convert Kilograms, Pounds, Ounces & More",
        description:
          "Free online weight converter tool. Convert between kilograms, pounds, ounces, grams and other weight units instantly. No downloads required.",
      },
      temperature: {
        title: "Temperature Converter | Convert Celsius, Fahrenheit & Kelvin",
        description:
          "Free online temperature converter tool. Convert between Celsius, Fahrenheit, and Kelvin temperature scales instantly. No downloads required.",
      },
      area: {
        title:
          "Area Converter | Convert Square Meters, Acres, Square Feet & More",
        description:
          "Free online area converter tool. Convert between square meters, square feet, acres, hectares and other area units instantly. No downloads required.",
      },
      volume: {
        title:
          "Volume Converter | Convert Liters, Gallons, Cubic Meters & More",
        description:
          "Free online volume converter tool. Convert between liters, gallons, cubic meters, and other volume units instantly. No downloads required.",
      },
      time: {
        title: "Time Converter | Convert Hours, Minutes, Seconds & More",
        description:
          "Free online time converter tool. Convert between hours, minutes, seconds, days, weeks and other time units instantly. No downloads required.",
      },
      speed: {
        title: "Speed Converter | Convert MPH, KPH, Knots & More",
        description:
          "Free online speed converter tool. Convert between miles per hour, kilometers per hour, knots and other speed units instantly. No downloads required.",
      },
      default: {
        title: "Unit Converter | Free Online Conversion Tool",
        description:
          "Free online unit converter tool. Convert between length, mass, temperature, area, volume, time, and speed units instantly. No downloads required.",
      },
    };

    const metadata =
      conversionTypeMap[conversionType] || conversionTypeMap.default;

    // Set the document title directly
    document.title = metadata.title;
  }, [conversionType, navigate]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <UnitConverter initialConversionType={conversionType} />
      </CardContent>
    </Card>
  );
};

export default UnitConverterPage;
