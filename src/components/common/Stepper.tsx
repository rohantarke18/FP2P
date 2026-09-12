import React, { useState, Children, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Stepper.css';

export interface RenderStepIndicatorParams {
  step: number;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  initialStep?: number;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  beforeStepChange?: (fromStep: number, toStep: number) => boolean | Promise<boolean>;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: React.ReactNode;
  nextButtonText?: React.ReactNode;
  finalStepButtonText?: React.ReactNode;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (params: RenderStepIndicatorParams) => React.ReactNode;
  stepTitles?: string[];
  showFooter?: boolean;
  renderFooter?: (params: {
    currentStep: number;
    totalSteps: number;
    isLastStep: boolean;
    isCompleted: boolean;
    handleBack: () => void;
    handleNext: () => void;
    handleComplete: () => void;
  }) => React.ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  currentStep: controlledStep,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  beforeStepChange,
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  finalStepButtonText = 'Complete',
  disableStepIndicators = false,
  renderStepIndicator,
  stepTitles,
  showFooter = true,
  renderFooter,
  className = '',
  ...rest
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);

  const activeStep = controlledStep !== undefined ? controlledStep : internalStep;
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = activeStep > totalSteps;
  const isLastStep = activeStep === totalSteps;

  useEffect(() => {
    if (controlledStep !== undefined && controlledStep !== internalStep) {
      setDirection(controlledStep > internalStep ? 1 : -1);
      setInternalStep(controlledStep);
    }
  }, [controlledStep, internalStep]);

  const updateStep = async (newStep: number) => {
    if (beforeStepChange) {
      const allowed = await beforeStepChange(activeStep, newStep);
      if (!allowed) return;
    }

    setDirection(newStep > activeStep ? 1 : -1);
    if (controlledStep === undefined) {
      setInternalStep(newStep);
    }
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      updateStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      updateStep(activeStep + 1);
    }
  };

  const handleComplete = () => {
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`outer-container ${className}`} {...rest}>
      <div
        className={`step-circle-container ${stepCircleContainerClassName}`}
        style={{ border: '1px solid var(--border-primary, #e2e8f0)' }}
      >
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            const title = stepTitles?.[index];

            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep: activeStep,
                    onStepClick: (clicked) => updateStep(clicked),
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    title={title}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={activeStep}
                    onClickStep={(clicked) => updateStep(clicked)}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={activeStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={activeStep}
          direction={direction}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray[activeStep - 1]}
        </StepContentWrapper>

        {showFooter && !isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            {renderFooter ? (
              renderFooter({
                currentStep: activeStep,
                totalSteps,
                isLastStep,
                isCompleted,
                handleBack,
                handleNext,
                handleComplete,
              })
            ) : (
              <div className={`footer-nav ${activeStep !== 1 ? 'spread' : 'end'}`}>
                {activeStep !== 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`back-button ${activeStep === 1 ? 'inactive' : ''}`}
                    {...backButtonProps}
                  >
                    {backButtonText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={isLastStep ? handleComplete : handleNext}
                  className="next-button"
                  {...nextButtonProps}
                >
                  {isLastStep ? finalStepButtonText : nextButtonText}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [parentHeight, setParentHeight] = useState<number | undefined>(undefined);

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight || 'auto' }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  key?: React.Key;
  children: React.ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    onHeightReady(containerRef.current.offsetHeight);

    // Track dynamic changes in step content (e.g. error alerts, upload previews)
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          onHeightReady(containerRef.current.offsetHeight);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.25, 1, 0.5, 1] }}
      style={{ position: 'relative', width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '60%' : '-60%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-60%' : '60%',
    opacity: 0,
  }),
};

export function Step({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`step-default ${className}`}>{children}</div>;
}

function StepIndicator({
  step,
  title,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: {
  step: number;
  title?: string;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="step-indicator"
      style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.85 } : {}}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#f1f5f9', color: '#64748b' },
          active: { scale: 1.08, backgroundColor: '#2563eb', color: '#ffffff' },
          complete: { scale: 1, backgroundColor: '#059669', color: '#ffffff' },
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner border border-slate-200/80 shadow-2xs"
      >
        {status === 'complete' ? (
          <CheckIcon className="check-icon" />
        ) : (
          <span className="step-number font-bold">{step}</span>
        )}
      </motion.div>
      {title && (
        <span
          className={`mt-1.5 text-[11px] font-medium text-center hidden md:block whitespace-nowrap transition-colors max-w-[100px] truncate ${
            status === 'active'
              ? 'text-blue-600 font-bold'
              : status === 'complete'
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-500'
          }`}
          title={title}
        >
          {title}
        </span>
      )}
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#2563eb' },
  };

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
