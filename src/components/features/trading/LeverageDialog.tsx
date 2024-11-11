import React from "react";
import { Button } from "../../ui/button";
import { Slider } from "../../ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

interface LeverageDialogProps {
  leverage: string;
  onLeverageChange: (value: string) => void;
}

export function LeverageDialog({ leverage, onLeverageChange }: LeverageDialogProps) {
  const [sliderValue, setSliderValue] = React.useState([parseFloat(leverage)]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    onLeverageChange(value[0].toString());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-between w-full">
          <span>Leverage</span>
          <span>{leverage}x</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Leverage</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="mb-4 text-2xl font-bold text-center">
            {sliderValue[0]}x
          </div>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            max={200}
            min={1}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1x</span>
            <span>50x</span>
            <span>100x</span>
            <span>150x</span>
            <span>200x</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
