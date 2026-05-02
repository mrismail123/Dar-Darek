import * as React from 'react'
import PropTypes from 'prop-types'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import OutlinedInput from '@mui/material/OutlinedInput'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'



function NumberSpinner({id: idProp, label, error, size = 'medium', ...other }) {
  const rootProps = {
    ...other,
    min: other.min ?? 0,
  }

  if (other.value === undefined) {
    rootProps.defaultValue = other.defaultValue ?? 0
  }
  
  let id = React.useId()
  if (idProp) {
    id = idProp
  }
  return (
    <BaseNumberField.Root
      {...rootProps}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          // Remove variant="outlined" to prevent default border styling on the FormControl
          sx={{
            display: 'inline-flex', // Ensure proper layout for children
            flexDirection: 'column',
            alignItems: 'center', // Center the input and buttons
            // Removed specific button border styles from here to customize directly on buttons
          }}
        >
          {props.children}
        </FormControl>
      )}
    >
      <BaseNumberField.ScrubArea
        render={
          <Box component="span" sx={{ userSelect: 'none', width: 'max-content' }} />
        }
      >
        <FormLabel
          htmlFor={id}
          sx={{
            display: 'inline-block',
            cursor: 'ew-resize',
            fontSize: '0.875rem',
            color: 'text.primary',
            fontWeight: 500,
            lineHeight: 1.5,
            mb: 0.5,
          }}
        >
          {label}
        </FormLabel>
        <BaseNumberField.ScrubAreaCursor>
          <OpenInFullIcon
            fontSize="small"
            sx={{ transform: 'translateY(12.5%) rotate(45deg)' }}
          />
        </BaseNumberField.ScrubAreaCursor>
      </BaseNumberField.ScrubArea>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Add gap between buttons and input */}
        <BaseNumberField.Decrement
          render={
            <Button
              variant="text" // Use text variant as a base
              aria-label="Decrease"
              size={size}
              sx={{
                borderRadius: '50%', // Make it circular
                width: 40, // Fixed width for circular shape
                height: 40, // Fixed height for circular shape
                minWidth: 40, // Override minWidth to ensure circularity
                p: 0, // Remove padding inside button
                border: (theme) => `1px solid ${theme.palette.divider}`, // Add a subtle border
                color: 'text.primary', // Ensure icon color is visible
                bgcolor: 'transparent', // No background by default
                '&:hover': {
                  bgcolor: 'action.hover', // Hover background
                  borderColor: (theme) => theme.palette.text.primary, // Border color on hover
                },
                '&.Mui-disabled': {
                  border: (theme) => `1px solid ${theme.palette.action.disabledBackground}`,
                  color: 'action.disabled',
                },
              }}
            />
          }
        >
          <RemoveIcon fontSize={size} />
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          // value={}
          id={id}
          render={(props, state) => (
            <OutlinedInput
              inputRef={props.ref}
              value={state.inputValue}
              onBlur={props.onBlur}
              onChange={props.onChange}
              onKeyUp={props.onKeyUp}
              onKeyDown={props.onKeyDown}
              onFocus={props.onFocus}
              notched={false} // Remove the notched effect for the label
              slotProps={{
                input: {
                  ...props,
                  size:
                    Math.max(
                      (other.min?.toString() || '').length,
                      state.inputValue.length || 1,
                    ) + 1,
                  sx: {
                    textAlign: 'center',
                    // Remove input padding for a tighter look
                    p: '8px 4px',
                  },
                },
              }}
              sx={{
                // Hide the border of the OutlinedInput
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                  borderWidth: '1px', // Keep border width for consistency on focus, but color transparent
                },
                // Ensure no padding around the input container itself
                pr: 0,
                pl: 0,
                py: 0,
                // Remove border radius to make it seamlessly integrate if it were next to other elements
                borderRadius: 0,
                // Allow the input to take necessary space but don't force it to grow
                flex: '0 1 auto',
                // Adjust minWidth to ensure it's not too small, but still adapts
                minWidth: 50,
              }}
            />
          )}
        />
        <BaseNumberField.Increment
          render={
            <Button
              variant="text" // Use text variant as a base
              aria-label="Increase"
              size={size}
              sx={{
                borderRadius: '50%', // Make it circular
                width: 40, // Fixed width for circular shape
                height: 40, // Fixed height for circular shape
                minWidth: 40, // Override minWidth to ensure circularity
                p: 0, // Remove padding inside button
                border: (theme) => `1px solid ${theme.palette.divider}`, // Add a subtle border
                color: 'text.primary', // Ensure icon color is visible
                bgcolor: 'transparent', // No background by default
                '&:hover': {
                  bgcolor: 'action.hover', // Hover background
                  borderColor: (theme) => theme.palette.text.primary, // Border color on hover
                },
                '&.Mui-disabled': {
                  border: (theme) => `1px solid ${theme.palette.action.disabledBackground}`,
                  color: 'action.disabled',
                },
              }}
            />
          }
        >
          <AddIcon fontSize={size} />
        </BaseNumberField.Increment>
      </Box>
    </BaseNumberField.Root>
  )
}

NumberSpinner.propTypes = {
  error: PropTypes.bool,
  /**
   * The id of the input element.
   */
  id: PropTypes.string,
  label: PropTypes.node,
  /**
   * The minimum value of the input element.
   */
  min: PropTypes.number,
  /**
   * The maximum value of the input element.
   */
  max: PropTypes.number,
  /**
   * The controlled value of the input element.
   */
  value: PropTypes.number,
  /**
   * Callback fired when the value changes.
   */
  onValueChange: PropTypes.func,
  size: PropTypes.oneOf(['medium', 'small']),
}

export default NumberSpinner
