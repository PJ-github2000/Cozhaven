import { motion } from 'framer-motion';

/**
 * AnimatedText component that reveals text character-by-character
 * @param {string} text - The text to be animated
 * @param {string} el - The HTML element to render (h1, h2, span, etc.)
 * @param {string} className - Optional CSS classes
 * @param {boolean} once - Whether the animation should only play once
 */
const AnimatedText = ({ text, el: Tag = "p", className, once = true, ...props }) => {
  // If text is a string, wrap it in an array to simplify logic
  const segments = Array.isArray(text) ? text : [text];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.02,
        duration: 0.5
      },
    },
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(4px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Tag className={className} {...props}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        style={{ display: 'block' }}
      >
        {segments.map((segment, sIndex) => (
          <span key={sIndex} style={{ display: 'block' }}>
            {segment.split("").map((char, cIndex) => (
              <motion.span
                key={`${sIndex}-${cIndex}`}
                variants={childVariants}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default AnimatedText;
