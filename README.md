# Conway's Game of Life

A colorful and interactive implementation of Conway's Game of Life using SolidJS and TypeScript. This version features colored cell patterns that evolve and interact with each other, creating beautiful and dynamic visualizations.

## Features

- 🎨 Colored Cell Patterns: Cells inherit colors from their neighbors, creating visually distinct regions
- ⚡ Real-time Updates: Fast simulation with 100ms intervals
- 🔄 Efficient State Management: Only changed cells are transmitted, reducing network load
- 👆 Interactive Grid: Click to toggle cells on/off with random colors
- 🔄 Reset Button: Return to the initial interesting pattern at any time

## Technical Implementation

- **Frontend**: SolidJS with TypeScript for reactive UI updates
- **State Management**: Efficient updates using SolidJS stores and reconciliation
- **Grid Size**: 50x50 cells with customizable visualization
- **Performance**: Optimized with incremental updates instead of full grid transfers
- **Communication**: Uses HTTP streaming for real-time updates (can be easily modified to use Server-Sent Events)
  - No WebSocket dependency required
  - Server streams updates using async generators
  - Client efficiently processes the streamed updates
  - Easily adaptable to SSE for broader browser support

## Implementation Approach

Our implementation takes a different approach compared to full-page streaming solutions:

### Granular Updates vs Full DOM Streaming

- We send only changed cells rather than the entire DOM
- Uses TypeScript discriminated unions for type-safe updates
- Leverages SolidJS's fine-grained reactivity system
- Performance optimized through incremental state updates

### Key Differences from Full-Page Streaming:

1. **Data Transfer**:
   - Our approach: Sends minimal JSON updates for changed cells only
   - Full-page streaming: Sends entire DOM chunks with morphing
2. **State Management**:
   - Our approach: Client maintains grid state, updates incrementally
   - Full-page streaming: Server maintains all state, client just renders
3. **Network Usage**:
   - Our approach: Lower bandwidth due to minimal updates
   - Full-page streaming: Relies on compression for efficiency
4. **Client Complexity**:
   - Our approach: More client-side logic but better state control
   - Full-page streaming: Simpler client but more server dependency

### Advantages of Our Approach:

- More granular control over updates
- Lower network bandwidth usage
- Better offline capabilities potential
- Independent client-side state management
- Easier to implement additional client-side features

## Game Rules

1. Any live cell with 2 or 3 live neighbors survives
2. Any dead cell with exactly 3 live neighbors becomes alive
3. All other cells die or stay dead
4. Colors are inherited from the most common neighbor color

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Interaction Guide

- **Click any cell**: Toggle it on/off (new cells get a random color)
- **Reset Button**: Return to the initial pattern
- **Watch**: See how the patterns evolve and colors interact

## Development

The project is built with:

- SolidJS for UI components
- TypeScript for type safety
- Server-side game logic for consistent simulation
- HTTP streaming for real-time updates (no WebSocket required)
- Efficient state updates using incremental changes

### Communication Flow

1. Initial connection: Client requests game state via HTTP
2. Server responds with:
   - Initial full grid state
   - Continuous stream of incremental updates
3. Updates are sent only when cells change
4. Client processes the stream and updates the UI efficiently

### Alternative Implementation

The code is structured to easily support Server-Sent Events (SSE) as an alternative to HTTP streaming:

- Similar event-based architecture
- Broader browser support
- Built-in reconnection handling
- No significant code changes required

## Project Structure

- `src/app.tsx`: Main application component and UI logic
- `src/server.ts`: Game logic and state management
- `src/app.css`: Styling for the grid and controls

## Contributing

Feel free to open issues or submit pull requests for:

- New features
- Bug fixes
- Performance improvements
- UI enhancements
- Alternative communication implementations (e.g., SSE)

## License

MIT License - Feel free to use this code for your own projects!
