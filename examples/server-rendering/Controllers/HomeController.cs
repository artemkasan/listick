using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace TestCore2Redux.Controllers {
	public class HomeController : Controller
	{
		public IActionResult Index ()
		{
			ViewData["initialState"] = new
			{
				counterState = new 
				{
					counter = 50
				}
			};
			return View ();
		}

		public IActionResult Error ()
		{
			ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
			return View ();
		}
	}
}