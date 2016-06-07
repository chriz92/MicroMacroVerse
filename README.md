# MicroMacroVerse

This repository contains the CG Project MicroMacroVerse made by Christian Huber and Jürgen Kieslich.

Concept:
After showing the solar system in detail, we will zoom on a planet, which will be given more system by replacing it with a highmapped model inside a skybox (other planets and stars) with some clouds (particle system). Again after that we will zoom into the particles of the cloud and will then render the atoms they are made of with an atom model (atom core and electrons)."
 
Special Effects:
- Terrain from heightmap
- Partical System

Some hints:
- Compute normal vectors for your terrain to allow correct phong shading. Reading the precomputed normals from another texture is allowed as well.
- The particle system has to use a (basic) physics simulation, the animations have to be time based and the the particles must be rendered with an appropriate technique.
- The solar system does not count as a manually composed model consisting of multiple parts. Make sure to add a model with clearly connected parts where the parts are animated and the model also moves as a whole at the same time!

Some more details regarding the camera:
You have to create a 30 second continuous movie with an animated camera (the user has no control over the camera during the whole duration).
By pressing the 'C'-key the user-controlled camera mode should be enabled. In the user-controlled camera mode the animations are triggered by flying close to the individual scenes (without disabling the user-controlled camera mode!).
Select at least 3 points (scenes/stages) in your movie where such trigger points make sense and describe them in your final documentation.
If your 3D world is very large think about a useful way to support the exploration of your scene with the user-controlled camera (and describe the controls in the documentation).

# Staff
 * chriz92 (@chriz92)
 * Jürgen Kieslich (@Sarrg)

# Launch

1. clone the repository: `git clone https://github.com/chriz92/MicroMacroVerse.git`
2. launch a http-server, see https://gist.github.com/willurd/5720255 
2 Alternative. Open the code folder in Atom.IO and download the LiveServer package, then press CTRL+SHIFT+3
3. access depending on the specified port using a WebGL compatible web browser (e.g., http://localhost:8080/)


# Structure
 * code
  * libs
   * `framework.js` basic utility functions for dealing with WebGL
   * `gl-matrix.js` see http://glmatrix.net/
  * project
   * has all the project files in it
 * howto 
  * User manual(screenshots + description of movie)
 * special_effect
  * Algorithmic description of chosen special effect(s)